namespace Tomewise.Api.DTOs;

public record UserResponseDto(
    string Id,
    string Email,
    string? FirstName,
    string? LastName,
    DateOnly CreatedDate,
    bool IsDisabled,
    int BookCount
);