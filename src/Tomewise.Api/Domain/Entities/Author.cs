namespace Tomewise.Api.Domain.Entities;

public class Author
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Biography { get; set; }

    // Navigation properties
    public ICollection<BookAuthor> BookAuthors { get; set; } = [];
}