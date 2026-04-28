using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using Tomewise.Api.Data;
using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExportController(BookTrackerDbContext context) : ControllerBase
{
    [HttpGet("goodreads")]
    public async Task<IActionResult> ExportGoodreads()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var items = await context.BookItems
            .Include(bi => bi.Book)
                .ThenInclude(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
            .Where(bi => bi.UserId == userId)
            .ToListAsync();

        var sb = new StringBuilder();

        // Goodreads CSV header
        sb.AppendLine("Title,Author,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Recommended For,Recommended By,Owned Copies");

        foreach (var item in items)
        {
            var book = item.Book;
            var author = book.BookAuthors.FirstOrDefault()?.Author.Name ?? "";
            var title = Escape(book.Title);
            var isbn10 = book.Isbn10 ?? "";
            var isbn13 = book.Isbn13 ?? "";
            var publisher = Escape(book.Publisher ?? "");
            var year = book.PublishedYear?.ToString() ?? "";
            var dateAdded = item.AcquiredDate?.ToString("yyyy/MM/dd") ?? "";

            var shelf = item.Status switch
            {
                BookStatus.InCollection => "read",
                BookStatus.Wishlist => "to-read",
                _ => "read"
            };

            sb.AppendLine($"{title},{author},{isbn10},{isbn13},0,0,{publisher},Paperback,{year},{year},,{dateAdded},,{shelf},,,,1,,,1");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", "tomewise-export-goodreads.csv");
    }

    private static string Escape(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}