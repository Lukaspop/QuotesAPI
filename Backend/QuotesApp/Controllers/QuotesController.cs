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


        // PUT: api/quotes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuote(int id, Quote quote)
        {
            if (id != quote.Id)
            {
                return BadRequest();
            }

            _context.Entry(quote).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuoteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        private bool QuoteExists(int id)
        {
            return _context.Quotes.Any(e => e.Id == id);
        }
        // DELETE: api/quotes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuote(int id)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            _context.Quotes.Remove(quote);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        

    }
}
