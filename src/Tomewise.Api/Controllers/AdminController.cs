using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tomewise.Api.Data;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController(
    BookTrackerDbContext context,
    UserManager<ApplicationUser> userManager) : ControllerBase
{

    // ── Users ──────────────────────────────────────────────

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        var users = await context.Users
            .OrderBy(u => u.CreatedDate)
            .ToListAsync();

        var result = new List<UserResponseDto>();

        foreach (var user in users)
        {
            var bookCount = await context.BookItems
                .CountAsync(bi => bi.UserId == user.Id);

            result.Add(new UserResponseDto(
                user.Id,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.CreatedDate,
                user.IsDisabled,
                bookCount
            ));
        }

        return Ok(result);
    }

    [HttpPut("users/{id}/disable")]
    public async Task<IActionResult> DisableUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.IsDisabled = true;
        await userManager.UpdateAsync(user);
        return NoContent();
    }

    [HttpPut("users/{id}/enable")]
    public async Task<IActionResult> EnableUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.IsDisabled = false;
        await userManager.UpdateAsync(user);
        return NoContent();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        await userManager.DeleteAsync(user);
        return NoContent();
    }

    // ── Invites ────────────────────────────────────────────

    [HttpGet("invites")]
    public async Task<ActionResult<IEnumerable<InviteResponseDto>>> GetInvites()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var invites = await context.Invites
            .Include(i => i.UsedBy)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(invites.Select(i => MapInvite(i, baseUrl)));
    }

    [HttpPost("invites")]
    public async Task<ActionResult<InviteResponseDto>> CreateInvite()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!;
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = Guid.NewGuid().ToString("N")[..16],
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(14),
            IsRevoked = false
        };

        context.Invites.Add(invite);
        await context.SaveChangesAsync();

        return Ok(MapInvite(invite, baseUrl));
    }

    [HttpPut("invites/{id}/revoke")]
    public async Task<IActionResult> RevokeInvite(Guid id)
    {
        var invite = await context.Invites.FindAsync(id);
        if (invite == null) return NotFound();

        invite.IsRevoked = true;
        await context.SaveChangesAsync();
        return NoContent();
    }

    private static InviteResponseDto MapInvite(Invite invite, string baseUrl) => new(
        invite.Id,
        invite.Code,
        $"{baseUrl}/register?invite={invite.Code}",
        invite.CreatedAt,
        invite.ExpiresAt,
        invite.IsRevoked,
        invite.UsedByUserId != null,
        invite.IsValid,
        invite.UsedBy?.Email
    );
}