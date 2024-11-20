**Purpose:** User Registration and Authentication:User will able to create new account and login . User also can reset password incase forgot the password or want to change with security token.

**Technology stack:**
1. User Module:
2. Database: MySql  
3. Version: 5.7.44
4. Backend: Node JS 
5. Version: v20.18.0
6. RESTFUL API
7. Auth: JWT token 
8. API testing: Postman
9. Version: 11.19.0

**End points**

Method:POST

	 /api/user/auth/register →Register a new user.
 
Method:POST

	 /api/user/auth/login →User login and token generation.
  
Method:POST

	api/user/auth/request-reset-password →Option to reset password

Method:POST

	/reset-password/:token →Get user's progress.

Method:GET

	/api/user/details →Get user's details

**Demo Video:**
https://1drv.ms/v/c/592eb2e7bd9c342f/EQO7CKe8w8RBpoItUPSzTEAB4TfN_N9qungxt_G5l4y8PQ?e=P1oPmm
