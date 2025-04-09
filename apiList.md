# TechTribe API's

# authRouter
- POST /signup
- POST /login
- POST /logout

# profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

# connectionRequestRouter
- POST /request/send/:status/:toUserId
- POST /request/review/:status/:toUserId

# userRouter
- GET /user/connections
- GET /user/requests
- GET /user/feed   -----> Gets you the profiles of other users on platform 


# Pagination
    - /feed?page=1&limit=10 => 1-10 => .skip(0) & .limit(10)
    - /feed?page=2&limit=10 => 11-20 => .skip(10) & .limit(10)
    - /feed?page=3&limit=10 => 21-30 => .skip(20) & .limit(10)
    - and so on .....

    --- Skip => (page - 1) * limit;



Status : ignore , interested , accepted , rejected