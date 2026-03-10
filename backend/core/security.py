from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "9c1f6d7e9c1a2b3c4d5e6f7a8b9c0d112233445566778899aabbccddeeff0011" # changeme
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")