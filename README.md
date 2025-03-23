# Features :
    - Create an account
    - Login
    - Update your profile
    - Feed Page - explore
    - send Connection Request
    - See our matches
    - See the request we have sent / received

# LLD(Low Level Design) :
# MongoDB Design :
    - Users :
        - FirstName
        - LastName
        - Email ID
        - Password
        - Age , Gender
        - .......
    - Connection Request
        - From userId
        - to userId
        - status ==== PENDING or ACCEPTED or REJECTED or IGNORE
        - .......

# API Design (REST API) : --- these are CRUD operations---
    - POST /signup
    - POST /login
    - GET /profile
    - POST /profile
    - PATCH /profile
    - DELETE /profile
    - POST /sendRequest ---> ignore , interested
    - POST /reviewRequest ---> accept , Reject
    - GET /requests
    - GET /connections
