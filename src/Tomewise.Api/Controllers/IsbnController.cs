using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tomewise.Api.Services;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IsbnController(
    IsbnLookupService isbnLookupService,
    LibrisLookupService librisLookupService) : ControllerBase
{
    [HttpGet("{isbn}")]
public async Task<IActionResult> Lookup(string isbn)
{
    var cleaned = new string(isbn.Where(char.IsDigit).ToArray());

    if (cleaned.Length != 10 && cleaned.Length != 13)
        return BadRequest("Invalid ISBN — must be 10 or 13 digits");

    var tasks = await Task.WhenAll(
        SafeLookup(() => isbnLookupService.LookupAsync(cleaned)),
        SafeLookup(() => librisLookupService.LookupAsync(cleaned))
    );

    var result = tasks[0] ?? tasks[1];

    if (result == null)
        return NotFound("No book found for this ISBN");

    return Ok(result);
}

private static async Task<IsbnLookupResultDto?> SafeLookup(
    Func<Task<IsbnLookupResultDto?>> lookup)
{
    try { return await lookup(); }
    catch { return null; }
}
}