using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<UserProfileResponseDto>> GetProfile()
    {
        var user = await userManager.FindByIdAsync(GetUserId());
        if (user == null) return NotFound();

        return Ok(new UserProfileResponseDto(
            user.Email!,
            user.FirstName,
            user.LastName,
            user.CreatedDate
        ));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequestDto request)
    {
        var user = await userManager.FindByIdAsync(GetUserId());
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return NoContent();
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequestDto request)
    {
        var user = await userManager.FindByIdAsync(GetUserId());
        if (user == null) return NotFound();

        if (request.NewPassword.Length < 8)
            return BadRequest("Password must be at least 8 characters");

        if (!request.NewPassword.Any(char.IsUpper))
            return BadRequest("Password must contain at least one uppercase letter");

        if (!request.NewPassword.Any(char.IsDigit))
            return BadRequest("Password must contain at least one number");

        var result = await userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors.FirstOrDefault()?.Description
                ?? "Failed to change password");

        return NoContent();
    }
}