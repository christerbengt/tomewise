namespace Tomewise.Api.DTOs;

public record ChangePasswordRequestDto(
    string CurrentPassword,
    string NewPassword
);