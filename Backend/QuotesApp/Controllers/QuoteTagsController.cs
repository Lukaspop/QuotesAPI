using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuotesApp.Data;
using QuotesApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuotesApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuoteTagsController : ControllerBase
    {
        private readonly QuoteDbContext _context;

        public QuoteTagsController(QuoteDbContext context)
        {
            _context = context;
        }

        // GET: api/quotetags
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuoteTag>>> GetQuoteTags()
        {
            return await _context.QuoteTags.ToListAsync();
        }
        // POST: api/quotetags
        [HttpPost]
        public async Task<ActionResult<QuoteTag>> PostQuoteTag(QuoteTag quoteTag)
        {
            if (quoteTag == null)
            {
                return BadRequest("QuoteTag cannot be null.");
            }

            _context.QuoteTags.Add(quoteTag);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetQuoteTag), new { id = quoteTag.QuoteId, tagId = quoteTag.TagId }, quoteTag);
        }

        // GET: api/quotetags/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<QuoteTag>> GetQuoteTag(int id)
        {
            var quoteTag = await _context.QuoteTags.FindAsync(id);
            if (quoteTag == null)
            {
                return NotFound();
            }
            return quoteTag;
        }
    }


}
