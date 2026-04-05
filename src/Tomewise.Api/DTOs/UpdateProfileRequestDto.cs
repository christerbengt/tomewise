namespace Tomewise.Api.DTOs;

public record UpdateProfileRequestDto(
    string? FirstName,
    string? LastName
);