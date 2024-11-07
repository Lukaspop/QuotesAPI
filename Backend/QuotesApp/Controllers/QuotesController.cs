using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuotesApp.Data;
using QuotesApp.Models;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QuotesApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuotesController : ControllerBase
    {
        private readonly QuoteDbContext _context;

        public QuotesController(QuoteDbContext context)
        {
            _context = context;
        }
        [Authorize]
        [HttpGet("me")]

        public async Task<ActionResult<IEnumerable<Quote>>> GetMyQuotes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var quotes = _context.Quotes.Where(x => x.UserId == userId);
            return Ok(quotes);
        }
        // GET: api/quotes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Quote>>> GetQuotes()
        {
            return await _context.Quotes.ToListAsync();
        }
        // GET: api/quotes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Quote>> GetQuote(int id)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }
            return quote;
        }
        // POST: api/quotes
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Quote>> PostQuote(Quote quote)
        {
            // Získání ID aktuálního přihlášeného uživatele
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized("Uživatel není přihlášen.");
            }

            // Přiřazení UserId k citátu
            quote.UserId = userId;

            // Přidání citátu do databáze
            _context.Quotes.Add(quote);
            await _context.SaveChangesAsync();

            // Vrácení informace o novém citátu
            return CreatedAtAction(nameof(GetQuote), new { id = quote.Id }, quote);
        }


        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuote(int id, Quote updatedQuote)
        {
            // Získání ID aktuálního uživatele
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existingQuote = await _context.Quotes.FindAsync(id);
            if (existingQuote == null)
            {
                return NotFound("Quote not found.");
            }

            // Zkontroluj, zda je citát uživatelův
            if (existingQuote.UserId != userId)
            {
                return Unauthorized("You can only update your own quotes.");
            }

            // Aktualizace citátu
            existingQuote.Text = updatedQuote.Text;
            _context.Entry(existingQuote).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return Ok(existingQuote);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMyQuote(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            // Zkontroluj, zda citát patří přihlášenému uživateli
            if (quote.UserId != userId)
            {
                return Unauthorized("You can only delete your own quotes.");
            }

            _context.Quotes.Remove(quote);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
