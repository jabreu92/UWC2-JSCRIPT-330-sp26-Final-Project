# UWC2-JSCRIPT-330-sp26-Final-Project
Repository for JS330 Course Final Project
# The Private Jet Business API README

- 1. A description of your project's context/subject matter (i.e. gaming, project management, image processing, etc.)
  - The Private Jet Business API is designed to be used by E-Commerce websites that want to buy or sell Private Jets.
- 2. A description of what problem your project seeks to solve.
  - The Private Jet Business API intends to provide an API for private jet vendors to use in their platforms and remove the dependency on third-party brokers for their private jet business.
- 3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
  - For this project we will have the following technical components:

    - Data Models:
        - a. UserSchema: Represents the customer who will make orders for buying a jet. Users can be divided as 'Admin' or 'Regular' in terms of roles & access.
        - b. ManufacturerSchema: Represents the company who builds the jet.
        - c. JetSchema: Represents the Private Jet to be bought/sold. Jets are manufactured by different Manufacturers.
        - d. OrderSchema: Represents the Purchase Order from a customer.

    - Unique Identifiers to keep in mind:
      - Manufacturers use a 'code' to distinguish themselves (e.g. Gulfstream uses 'GUL').
      - Jets use an SKU or tail number to identify a unique jet assigned by the FAA (e.g. GS-LR-G700-26).
      - Orders use an orderNumber for easy lookup of a customer purchase (e.g. ORD-1778282206062-B750).

    - Routes:
      - All routes will be called through an index route in order to keep them modular.
      - Below is a table with a list of the essential routes.
      - "Mixed" means both Admin and Regular users can use the endpoint.

      | Method | Endpoint                  | Access | Description                                          |
      |--------|---------------------------|--------|------------------------------------------------------|
      | GET    | /jet/search               | Public | Search the jet catalog by keyword                    |
      | POST   | /jet                      | Admin  | Add a new jet to the catalog                         |
      | GET    | /jet                      | Mixed  | View all jets                                        |
      | GET    | /jet/:sku                 | Public | View a specific jet                                  |
      | PATCH  | /jet/:sku                 | Admin  | Update jet details                                   |
      | DELETE | /jet/:sku                 | Admin  | Remove a jet from the catalog                        |
      | POST   | /manufacturer             | Admin  | Add a new jet manufacturer                           |
      | GET    | /manufacturer             | Public | View all jet manufacturers                           |
      | GET    | /manufacturer/:code       | Public | View a specific jet manufacturer                     |
      | PUT    | /manufacturer/:code       | Admin  | Update a jet manufacturer                            |
      | DELETE | /manufacturer/:code       | Admin  | Remove a jet manufacturer                            |
      | POST   | /order                    | Mixed  | Add a new order                                      |
      | GET    | /order                    | Mixed  | Admin sees all orders; Regular users see only theirs |
      | GET    | /order/:orderNumber       | Mixed  | View a specific order                                |
      | PATCH  | /order/:orderNumber       | Admin  | Update order details                                 |
      | DELETE | /order/:orderNumber       | Admin  | Delete an order                                      |
      | POST   | /user                     | Public | Register a new user                                  |
      | GET    | /user                     | Admin  | Get all users                                        |
      | GET    | /user/:email              | Admin  | Get a user by email                                  |
      | PATCH  | /user/change-password     | Mixed  | Update user password                                 |
      | PUT    | /user/:email              | Admin  | Update user details                                  |
      | DELETE | /user/:email              | Admin  | Delete a user                                        |
      | POST   | /login                    | Public | Log in a user and create a JWT token                 |

    - Below we list the technologies that will be used in this project:

    - a. For this project we will be using MongoDB for our database. We will be filling in dummy data for demo purposes. Additionally, we will be using the text search feature from MongoDB to search the jet catalog. Finally, we will be using indexes for performance and uniqueness where needed.
    - b. For Authentication we will be using jsonwebtoken and bcryptjs to handle token signing and password hashing.
    - c. For Authorization we will be using the Middleware concepts learned in class.
    - d. For Unit Tests we will be using the Jest framework learned in class.

- 4. Clear and direct call-outs of how you will meet the various project requirements.
    - To meet the project requirements we must achieve the following:
    - 1. Routes should be fully tested with a coverage of 80% or higher. This will be done by writing unit tests for each route defined in the table above and using the Jest framework.
    - 2. We will be performing an End-to-End test that will go through the following business logic of the API:

    - Here are some of the business logic cases to go through:
        - a. Sign up & log in as a Customer and as an Admin.
        - b. Browse the Jet Catalog & search for a specific Jet.
        - c. Get information on the Jet of interest and its manufacturer.
        - d. Make a Purchase Order for the Jet.
        - e. Get the Purchase Order approved by the Admin.
        - f. View the customer order.
        - g. Verify the purchased Jet is no longer in the Catalog.

    - 3. Our End-to-End test must cover the authentication & authorization components of the API.
    - 4. We will be creating a Postman collection for the End-to-End testing and present it to the class.

- 5. A timeline for what project components you plan to complete, week by week, for the remainder of the class.
    - Week 1: Define in Express the Models, DAOs, and Routes.
    - Week 2: Set up & connect MongoDB and a Postman collection to start testing the basic CRUD operations.
    - Week 3: Implement Authentication with JWT tokens and bcrypt password hashing, and use middleware for authorization.
    - Week 4: Write unit tests to achieve 80% coverage for the routes & perform End-to-End testing.
    - Week 5: Present the project to the class with an End-to-End example.

# Proof of Concept

- 1. Project update in README explains what has been finished and what still needs to be done.
  - As of now, The Private Jet Business API Project is 80% complete. Below is a list of the things completed:
    - a. Models, DAOs, Controllers, Routes, and Middleware code implementation.
    - b. Unit Tests for the routes, DAOs & edge cases.
    - c. Documentation of the project.
    - d. Express Server & MongoDB connection is established.
- 2. What is remaining of the project?
  - The Postman collection covering all CRUD operations and End-to-End testing has to be created.
  - Create an End-to-End test for the business case of a Jet Purchase.
  - Present the Private Jet Business API to the class with a Postman Collection.

# Self Evaluation

  - 1. What you learned?
      - This project taught me the skills of creating a back-end service for a real-world business idea.
      - Putting into practice all the lessons from the course into a single project was a major highlight of this course.
  - 2. What you would like to do differently or improve upon?
      - I should have spent more time understanding the nature of how the Jet Business works and how the different business scenarios are defined & executed.
      - I would have definitely improved in structuring the planning phase & requirements of this project. I felt that I had to go back and rethink different business scenarios that I had not considered initially.
  - 3. Explain what worked well and what didn't.
    - Something that worked well was the separation of controllers, routes, DAOs, models & middleware. Keeping the functionality of each layer separate helped a lot in maintaining the project organized and easy to follow.
    - Something that did not work well was choosing the primary keys for some of the models. Using the auto-generated ID is not human-readable, and I had to figure out a way to associate jets and other models by creating unique IDs that would be easy to maintain and read. Testing was also challenging due to a lot of trial and error in covering each test path.
