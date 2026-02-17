"""Auth endpoints: register, login, logout, me, forgot/reset password, verify email."""
from datetime import datetime, timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, PasswordResetToken, EmailVerifyToken
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.api.deps import get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.email import send_email
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _set_cookie(response: Response, value: str, max_age: int) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=value,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_same_site,
        domain=settings.cookie_domain,
    )


def _clear_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        domain=settings.cookie_domain,
    )


@router.post("/register", response_model=UserResponse)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user. Password is hashed server-side."""
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    await db.flush()
    token = secrets.token_urlsafe(32)
    verify = EmailVerifyToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.verify_token_expire_minutes),
    )
    db.add(verify)
    # Single commit is done by get_db when the request ends
    await send_email(
        user.email,
        "Verify your email",
        f"Link: {settings.frontend_url}/verify-email?token={token}",
    )
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_verified=user.is_verified,
        is_active=user.is_active,
    )


@router.post("/login", response_model=UserResponse)
async def login(body: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    """Authenticate and set httpOnly session cookie."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    access = create_access_token(user.id)
    max_age = settings.access_token_expire_minutes * 60
    _set_cookie(response, access, max_age)
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_verified=user.is_verified,
        is_active=user.is_active,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    """Clear session cookie."""
    _clear_cookie(response)
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Return current user from session cookie. 401 if not authenticated."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_verified=current_user.is_verified,
        is_active=current_user.is_active,
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Create reset token and send email (stub logs to console)."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        return MessageResponse(message="If that email is registered, you will receive a reset link.")
    token = secrets.token_urlsafe(32)
    reset = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.reset_token_expire_minutes),
    )
    db.add(reset)
    link = f"{settings.frontend_url}/reset-password?token={token}"
    await send_email(user.email, "Password reset", f"Reset link: {link}")
    return MessageResponse(message="If that email is registered, you will receive a reset link.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Set new password using token from email."""
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == body.token,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > datetime.utcnow(),
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    user_result = await db.execute(select(User).where(User.id == row.user_id))
    user = user_result.scalar_one()
    user.hashed_password = hash_password(body.new_password)
    user.updated_at = datetime.utcnow()
    row.used = True
    return MessageResponse(message="Password updated. You can log in now.")


@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """Verify email using token from link."""
    result = await db.execute(
        select(EmailVerifyToken).where(
            EmailVerifyToken.token == token,
            EmailVerifyToken.used == False,
            EmailVerifyToken.expires_at > datetime.utcnow(),
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")
    user_result = await db.execute(select(User).where(User.id == row.user_id))
    user = user_result.scalar_one()
    user.is_verified = True
    user.updated_at = datetime.utcnow()
    row.used = True
    return MessageResponse(message="Email verified. You can log in now.")
