# UWC2-JSCRIPT-330-sp26-Final-Project
Repository for JS330 Course Final Project
# The Private Jet Business API README

- 1. A description of your project's context/subject matter (i.e. gaming, project management, image processing, etc.)
  - The Private Jet Business API is design to be used by Private Jet Enterprise Marketplaces for customers who are in need of a private jet for their business or personal needs.
- 2. A description of what problem your project seeks to solve.
  - The Private Jet Business API intends to provide an API for private jet vendors to be used on their enterprise platforms and eliminate the problem of relying on third party brokers for providing information and helping to sale private jets.
- 3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
  - For this project we will have the following techincal components:
    - Data Models:
        - a. UserSchema: Represents the customer who will make orders for buying a jet. Users can be divided as 'Admin' or 'Regular' for terms of roles & access
        - b. ManufacturerSchema: Represents the company who builds the jet.
        - c. JetModelSchema: Represents the Private Jet model made by a particular Manufacturer.
        - d. OrderSchema: Represents the Buy order from a customer for a jet purchase.
    - Routes: Below is a Table that structures the routes of the project:

    - |  Method  | Endpoint |   | Access   | | Description |
    - |   GET    |   /jets  |   | All      | | View All Jets |
    - |   GET    |   /jets/:tailNumber  |  All     | | View Specific Jet |
    - |   POST   |   /jets  |   | Admin    | | Add new jet to catalog |
    - |   PATCH  |   /jets/:tailNumber || Admin    | | Update jet details |
    - |   DELETE |   /jets/:tailNumber || Admin    | | Remove a jet from the catalog |
    - |   GET    |   /manufacturer |   | All  | | View all Jet Manufacturers |
    - |   GET    |   /manufacturer/:slug |   | All  | | View Specific Jet Manufacturer |
    - |   POST   |   /manufacturer  |   | Admin    | | Add new a Jet Manufacturer |
    - |   DELETE |   /manufacturer/:slug || Admin    | | Remove a Jet Manufacturer  |
    - |   PATCH  |   /manufacturer/:slug || Admin    | | Update a Jet Manufacturer |
    - |   POST   |   /orders   || Regular  | | Purchase a jet |
    - |   GET    |   /orders   || Mixed    | | Admin sees all, User sees own |
    - |   DELETE   |  /orders/:id   || Admin  | | Delete an order |

    - Below we list the technologies that will be used in this project:

    - a. For this project we will be using MongoDB for our database. We will be filling dummy data for demo purposes. Additionaly, we will be using the text search feature from MongoDB to help us look for the jets catalog. Finally, we will be using indexes for performance and uniquness when needed.
    - b. For Authentication we will be using jsonwebtoken and bycryptjs to handle token signing and password hashing
    - c. For Authortization we will be using the Middleware concepts learned in class.
    - d. For Unit Tests we will be using the JTest framework learned in class.
- 4. Clear and direct call-outs of how you will meet the various project requirements. 
    - To meet the project requirements we must achieve the following:
    - 1. Routes should be fully testsed with a coverege of 80% or higher. This will be done by writting unit tests for each route defined in the table above and using the JTests framework.
    - 2. We will be performing an End to End test that will be going thru the following business logic of the API:
    - Here are some of the business logic cases to go thru.
        - a. Signup & Logout of a Customer & Admin.
        - b. Browse the Jet Catalog & Search for a specific Jet.
        - c. Get information of the Jet of interest & the manufacturer.
        - d. Make Purchase Order for the Jet
        - e. Get the Purchase Order approved by the Admin.
        - f. See the customer order & Admin to view all the orders
        - g. Remove the Purchased Jet from the Catalog.
    - 3. Our End to End test must cover the authentication & authorization components of the API.
    - 4. We will be creating a postman collection for the End to End testing and present it to the class.
- 5. A timeline for what project components you plan to complete, week by week, for the remainder of the class. 
    - Week 1: Define in express the Model, DAOS and Routes
    - Week 2: Setup & connect the MongoDB & Postman collection to start testing the BASIC CRUD Operations
    - Week 3: Implement Authentication with JWT Token and Bycript password and Use middleware for authorization.
    - Week 4: Write Unit Test coverage of 80% for the routes & Perfrom an End to End testing.
    - Week 5: Present the Project to the class with an End to End example.  