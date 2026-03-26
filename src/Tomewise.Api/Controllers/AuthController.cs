using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.Services;

namespace Tomewise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    TokenService tokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedDate = DateOnly.FromDateTime(DateTime.Today)
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var token = tokenService.GenerateToken(user);
        return Ok(new { token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized("Invalid email or password");

        var token = tokenService.GenerateToken(user);
        return Ok(new { token });
    }
}

public record RegisterRequest(
    string Email,
    string Password,
    string? FirstName,
    string? LastName);

public record LoginRequest(
    string Email,
    string Password);