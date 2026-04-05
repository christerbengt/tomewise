namespace Tomewise.Api.DTOs;

public record UserProfileResponseDto(
    string Email,
    string? FirstName,
    string? LastName,
    DateOnly CreatedDate
);