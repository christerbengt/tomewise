namespace Tomewise.Api.DTOs;

public record InviteResponseDto(
    Guid Id,
    string Code,
    string InviteUrl,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    bool IsRevoked,
    bool IsUsed,
    bool IsValid,
    string? UsedByEmail
);