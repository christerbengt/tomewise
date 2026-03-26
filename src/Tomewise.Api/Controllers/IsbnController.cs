using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tomewise.Api.Services;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IsbnController(IsbnLookupService isbnLookupService) : ControllerBase
{
    [HttpGet("{isbn}")]
    public async Task<IActionResult> Lookup(string isbn)
    {
        var cleaned = new string(isbn.Where(char.IsDigit).ToArray());

        if (cleaned.Length != 10 && cleaned.Length != 13)
            return BadRequest("Invalid ISBN — must be 10 or 13 digits");

        var result = await isbnLookupService.LookupAsync(cleaned);

        if (result == null)
            return NotFound("No book found for this ISBN");

        return Ok(result);
    }
}