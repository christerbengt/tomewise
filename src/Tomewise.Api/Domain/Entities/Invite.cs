namespace Tomewise.Api.Domain.Entities;

public class Invite
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string CreatedByUserId { get; set; } = string.Empty;
    public string? UsedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }

    // Navigation properties
    public ApplicationUser CreatedBy { get; set; } = null!;
    public ApplicationUser? UsedBy { get; set; }

    public bool IsValid => !IsRevoked && 
                           UsedByUserId == null && 
                           ExpiresAt > DateTime.UtcNow;
}