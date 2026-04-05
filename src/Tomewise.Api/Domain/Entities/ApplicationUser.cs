using Microsoft.AspNetCore.Identity;

namespace Tomewise.Api.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly CreatedDate { get; set; }
    public bool IsDisabled { get; set; }

    // Navigation properties
    public ICollection<Invite> CreatedInvites { get; set; } = [];
    public ICollection<Invite> UsedInvites { get; set; } = [];
}