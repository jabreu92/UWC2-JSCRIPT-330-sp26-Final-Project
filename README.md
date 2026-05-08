# UWC2-JSCRIPT-330-sp26-Final-Project
Repository for JS330 Course Final Project
# The Private Jet Business API README

- 1. A description of your project's context/subject matter (i.e. gaming, project management, image processing, etc.)
  - The Private Jet Business API is design to be used by E-Commerce websites that want to buy or sell Private Jets.
- 2. A description of what problem your project seeks to solve.
  - The Private Jet Business API intends to provide an API for private jet vendors to use in their platforms and remove the dependency of third party brokers for their private jet business.
- 3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
  - For this project we will have the following techincal components:
    
    - Data Models:
        - a. UserSchema: Represents the customer who will make orders for buying a jet. Users can be divided as 'Admin' or 'Regular' for terms of roles & access.
        - b. ManufacturerSchema: Represents the company who builds the jet.
        - c. JetSchema: Represents the Private Jet to be bought/sold. Jets are manufactured by different Manufacturers.
        - d. OrderSchema: Represents the Purchase Order from a customer.
    
    - Unique Identifiers to keep in mind:
      - Manufacturer's use a 'code' to distinguish themselves (e.g Gulfstream uses 'GUL').
      - Jets use an SKU or TailNumber to identify a unique Jet that is assigned by the FAA (e.g GS-LR-G700-26).
      - Orders use an orderNumber for easy lookup for a customer purchase( e.g ORD-1778282206062-B750 ).

    - Routes:
      - All routes will be called thru an index route in order to keep them modular.
      - Below is a Table with a list of the essentials routes. 
      - The Mixed term means Admins & Regulars users can use this endpoint:

    - |  Method  | Endpoint |   | Access   | | Description |

    - |   POST   |   /jet       | Admin    | | Add new jet to the catalog 
    - |   GET    |   /jet       | Mixed    | | View All Jets 
    - |   GET    |   /jet/:sku  |  Mixed   | | View a Specific Jet 
    - |   PATCH  |   /jet/:sku  | Admin    | | Update jet details 
    - |   DELETE |   /jet/:sku  | Admin    | | Remove a jet from the catalog 

    - |   POST   |   /manufacturer | Admin | | Add new a Jet Manufacturer 
    - |   GET    |   /manufacturer | Mixed | | View all Jet Manufacturers 
    - |   GET    |   /manufacturer/:code | Mixed  | | View a Specific Jet Manufacturer 
    - |   PUT  |     /manufacturer/:code || Admin | | Update a Jet Manufacturer 
    - |   DELETE |   /manufacturer/:code || Admin | | Remove a Jet Manufacturer  

    - |   POST   |   /order   || Mixed    || Add a new order 
    - |   GET    |   /order   || Mixed    || Admin sees all orders, Regular Users see only their own orders 
    - |   GET    |   /order/:orderNumber  || Mixed | View a specific order
    - |   PATCH  |   /order/:orderNumber  || Admin | Update order details 
    - |   DELETE |  /order/:orderNumber   || Admin | Delete an order 

    - |   POST   |   /user     || Mixed     || Add a User  
    - |   GET    |   /user     || Admin     || Get all Users
    - |   GET    |   /user/:email  || Admin || Get a user by email
    - |   Patch  |   /user/change-password  || Mixed | Update User Password 
    - |   PUT    |   /user/:email  || Admin || Update uder details 
    - |   DELETE |  /user/:email   || Admin || Delete a User 

    - |   POST   |  /login     || Mixed     || Logs a User & creates JWT Token

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
        - a. Signup & Login of a Customer & Admin.
        - b. Browse the Jet Catalog & Search for a specific Jet.
        - c. Get information of the Jet of interest & the manufacturer.
        - d. Make a Purchase Order for the Jet
        - e. Get the Purchase Order approved by the Admin.
        - f. See the customer order
        - g. Verify the Purchased Jet is no longer in the Catalog.

    - 3. Our End to End test must cover the authentication & authorization components of the API.
    - 4. We will be creating a postman collection for the End to End testing and present it to the class.

- 5. A timeline for what project components you plan to complete, week by week, for the remainder of the class. 
    - Week 1: Define in express the Model, DAOS and Routes
    - Week 2: Setup & connect the MongoDB & Postman collection to start testing the BASIC CRUD Operations
    - Week 3: Implement Authentication with JWT Token and Bycript password and Use middleware for authorization.
    - Week 4: Write Unit Test coverage of 80% for the routes & Perfrom an End to End testing.
    - Week 5: Present the Project to the class with an End to End example.  