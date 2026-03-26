namespace Tomewise.Api.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<BookItemTag> BookItemTags { get; set; } = [];
}