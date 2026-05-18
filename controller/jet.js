import * as JetDAO from '../daos/jet.js';
import { findByCode } from '../daos/manufacturer.js';
import mongoose from 'mongoose';
import Jet from '../models/jet.js';

export const createJet = async (req, res) => {
  try {
    const { sku, name, year, price, manufacturerCode, range, capacity } = req.body;

    if (!sku || !manufacturerCode) {
      return res.status(400).json({ message: "SKU and Manufacturer Code are required." });
    }

    const manufacturerDoc = await findByCode(manufacturerCode);

    if (!manufacturerDoc) {
      return res.status(404).json({
        message: `Manufacturer with code '${manufacturerCode}' not found.`
      });
    }

    const newJet = await JetDAO.createOneJet({
      sku, name, year, price, range, capacity,
      manufacturer: manufacturerDoc._id
    });

    res.status(201).json({ message: "Jet created successfully", data: newJet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJetBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    if (!sku) return res.status(400).json({ message: "SKU is required." });

    // Performance check for single SKU lookup
    await logIndexReport({ sku: sku });

    const jet = await JetDAO.findJetBySku(sku);
    if (!jet) return res.status(404).json({ message: `Jet ${sku} not found.` });

    res.status(200).json({ data: jet });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving jet", error: error.message });
  }
};

export const getJets = async (req, res) => {
  try {
    let jets;
    const isAdmin = req.user && req.user.role === 'admin';

    // 1. Generate the Index Report based on the query that will actually run
    if (isAdmin) {
      await logIndexReport({}, { createdAt: -1 }); // Report for Admin view
      jets = await JetDAO.getAllJets();
    } else {
      await logIndexReport({ isAvailable: true }, { price: 1 }); // Report for User view
      jets = await JetDAO.findAvailableJets();
    }

    res.status(200).json({
      count: jets.length,
      data: jets
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving catalog", error: error.message });
  }
};

export const updateJet = async (req, res) => {
  try {
    const { sku } = req.params;
    const { price } = req.body;

    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        message: "Price must be a positive number."
      });
    }

    const updated = await JetDAO.updateOneJetBySku(sku, req.body);
    if (!updated) return res.status(404).json({ message: `Jet ${sku} not found.` });

    res.status(200).json({ message: "Jet updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

export const deleteJet = async (req, res) => {
  try {
    const { sku } = req.params;
    const deleted = await JetDAO.deleteOneJetBySku(sku);

    if (!deleted) return res.status(404).json({ message: `Jet ${sku} not found.` });

    res.status(200).json({ message: `Jet ${sku} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

export const searchJets = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query required" });

    const results = await JetDAO.searchJets(q);
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logIndexReport = async (query, sortOptions = {}) => {
  try {
    // Mimic DB request and return a JSON report detailing the search strategy used.
    // Details include, how many documents it looked at, and how long it took
    const explanation = await Jet.find(query)
      .sort(sortOptions)
      .explain('executionStats');

    const stats = explanation.executionStats; // Contains the raw numbers (Total time, documents scanned, documents returned).
    const winningPlan = explanation.queryPlanner.winningPlan; // The winningPlan is the fastest method MongoDB chose to get the job done.

    /**
     * Top-level stage  FETCH means that it found the index and gets the full document, 
     * Strategy is hidden one level deeper in the inputStage. 
     * This extracts the actual search method (like IXSCAN or COLLSCAN)
     */
    const stage = winningPlan.stage === 'FETCH' || winningPlan.stage === 'SHARD_MERGE'
      ? winningPlan.inputStage.stage
      : winningPlan.stage;

    console.log("\n🚀 --- MONGODB INDEX REPORT ---");
    console.log(`Query Path: ${stage}`); // Determines the strategy it useds for search (Index Scan vs. Collection Scan).
    console.log(`Docs Examined: ${stats.totalDocsExamined}`);// How many items the database had to open.
    console.log(`Docs Returned: ${stats.nReturned}`); // How many items actually matched your search.

    if (stage === 'IXSCAN') { // IXSCAN (Index Scan): The database used (Index) to find the data. Very fast
      console.log("✅ RESULT: Gold Medal! Index is being used.");
    } else if (stage === 'COLLSCAN') { // The database had to read every single document in the collection. This is slow and uses a lot of CPU/Memory
      console.log("⚠️ RESULT: Performance Warning. Collection Scan detected.");
    }
    console.log("-------------------------------\n");
  } catch (err) {
    console.error("Could not generate index report:", err.message);
  }
};