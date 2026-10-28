import { records, matchingRows, pageRows, exportCsv } from './model.mjs';
const $ = s => document.querySelector(s);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let limit = 10, selected = new Set(), notes = new Map(), lastFocus, toastTimer;
const filters = () => ({ query: $('#search').value, contact: $('#filter').value, sort: $('#sort').value });
function notice(message) {
  clearTimeout(toastTimer); $('#notice').textContent = message; $('#notice').hidden = false;
  toastTimer = setTimeout(() => { $('#notice').hidden = true; }, 5000);
}
function render() {
  const all = matchingRows(filters()), visible = pageRows(filters(), limit);
  $('#rows').innerHTML = visible.map(r => `<tr>
    <td data-label="Select"><input type="checkbox" data-select="${r.id}" aria-label="Select ${r.name}" ${selected.has(r.id) ? 'checked' : ''}></td>
    <td data-label="Rank"><strong>P${r.rank}</strong><small class="coverage">Provisional sample rank</small></td>
    <td data-label="Movement"><span class="move">No comparison</span></td>
    <td data-label="Lawyer / firm"><div class="sample-identity"><span class="avatar">${r.id}</span><div class="lawyer-cell"><button data-detail="${r.id}">${r.name}<small>${r.firm}</small><small>${r.town}, NJ</small></button></div></div></td>
    <td data-label="Sample score"><strong class="score">${r.score}</strong><small class="coverage">Practice ${r.scope} + Experience ${r.experience}</small></td>
    <td data-label="Evidence">Demonstration<small class="coverage">No real source verification</small></td>
    <td data-label="Sample contact">${r.email ? 'Sample email present' : 'Email unknown'}<small class="coverage">Not for outreach</small></td>
    <td data-label="Research status"><span class="badge provisional">Provisional</span><small class="coverage">Fictional attorney</small></td>
    <td data-label="Review"><button data-detail="${r.id}" aria-label="Review ${r.name}">Review →</button></td>
  </tr>`).join('');
  $('#loaded-count').textContent = visible.length;
  $('#results-label').textContent = `Showing ${visible.length} of ${all.length} matching sample records`;
  $('#empty').hidden = !!visible.length;
  $('#next').disabled = visible.length >= all.length;
  $('#next').textContent = visible.length >= all.length ? 'All matching samples loaded' : 'Load Next 10 →';
  $('#selected-metric').textContent = selected.size;
  $('#selection-count').textContent = `${selected.size} selected`;
  $('#selection-bar').hidden = selected.size === 0;
  const selectedVisible = visible.filter(r => selected.has(r.id)).length;
  $('#select-all').checked = visible.length > 0 && selectedVisible === visible.length;
  $('#select-all').indeterminate = selectedVisible > 0 && selectedVisible < visible.length;
  $('#select-all').disabled = visible.length === 0;
}
function modal(title, html) {
  lastFocus = document.activeElement;
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = html;
  $('#dialog').showModal(); $('#dialog-title').focus();
}
function detail(id) {
  const r = records.find(x => x.id === id); if (!r) return;
  modal(r.name, `<div class="banner amber">Fictional presentation record. Not a real attorney or outreach prospect.</div>
    <p>${r.firm} · ${r.town}, New Jersey</p>
    <dl class="detail-grid"><div><dt>Sample research rank</dt><dd>P${r.rank} · ties share a rank</dd></div><div><dt>Sample BASE score</dt><dd>${r.score} / 100</dd></div><div><dt>Practice relevance</dt><dd>${r.scope} / 60</dd></div><div><dt>Relevant experience</dt><dd>${r.experience} / 40</dd></div><div><dt>Sample email</dt><dd>${r.email || 'Unknown'}</dd></div><div><dt>Official registration and discipline</dt><dd>Not verified</dd></div></dl>
    <h3>Why this sample rank</h3><p>This fictional example combines a practice relevance score of ${r.scope} and an experience score of ${r.experience}. Equal totals share a rank. Scores illustrate the interface and do not assess real legal quality.</p>
    <div class="evidence-card"><strong>Evidence status</strong><p>${r.citation}</p><small>No live retrieval date or source citation is claimed.</small></div>
    <label class="sample-note">Temporary sample note<textarea id="note" maxlength="1000" placeholder="Add a sample note for this presentation...">${escape(notes.get(id) || '')}</textarea></label>
    <small>Kept only in this open page. Reset or reload clears sample notes.</small>
    <div class="dialog-actions"><button class="primary" id="save-note">Save sample note</button><button id="detail-select">${selected.has(id) ? 'Remove from sample selection' : 'Select for sample call list'}</button></div>`);
  $('#save-note').onclick = () => { notes.set(id, $('#note').value); notice('Sample note saved for this open page.'); };
  $('#detail-select').onclick = () => { selected.has(id) ? selected.delete(id) : selected.add(id); render(); $('#detail-select').textContent = selected.has(id) ? 'Remove from sample selection' : 'Select for sample call list'; };
}
function methodology() {
  modal('How research ranking works', '<p>The dashboard separates provisional research from verified eligibility. The presentation uses fictional examples only.</p><div class="evidence-card"><strong>BASE score = practice relevance + relevant experience</strong><p>Practice relevance contributes up to 60 points. Documented relevant experience contributes up to 40 points. Missing required evidence remains unknown.</p></div><p>Equal totals share the same rank. Payment, advertising, and commercial interest never affect the research score. Professional registration, discipline, and contact review are separate checks before outreach.</p>');
}
function guide() {
  modal('A quick dashboard walkthrough', '<p>Use this page to demonstrate the workflow in your video. All names, scores, firms, and emails are fictional samples.</p><ol class="presentation-steps"><li><strong>Show the market.</strong> New Jersey, Bergen County, Divorce &amp; Family Law.</li><li><strong>Explore the shortlist.</strong> Start with ten rows, then use Load Next 10 to append more.</li><li><strong>Find and review.</strong> Search a town or firm and open a record to explain ranking and evidence.</li><li><strong>Prepare a call list.</strong> Select sample records and download the fictional CSV.</li><li><strong>Reset for another take.</strong> Reset demonstration clears selections, temporary notes, and filters.</li></ol><p>This online demo does not log in to the private application, retrieve live research, or send anything to a CRM.</p>');
}
function download(ids) {
  if (!ids.size) { notice('Select at least one sample record.'); return; }
  const url = URL.createObjectURL(new Blob(['\ufeff', exportCsv(ids)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = '201lawyers-FICTIONAL-DEMO-call-list.csv';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  notice(`Downloaded ${ids.size} fictional samples. No CRM records were created.`);
}
$('#rows').addEventListener('click', e => { const button = e.target.closest('[data-detail]'); if (button) detail(button.dataset.detail); });
$('#rows').addEventListener('change', e => { const input = e.target.closest('[data-select]'); if (!input) return; input.checked ? selected.add(input.dataset.select) : selected.delete(input.dataset.select); render(); });
$('#select-all').onchange = e => { for (const r of pageRows(filters(), limit)) e.target.checked ? selected.add(r.id) : selected.delete(r.id); render(); };
$('#search').oninput = () => { limit = 10; render(); };
for (const id of ['filter', 'sort']) $(`#${id}`).onchange = () => { limit = 10; render(); };
$('#top').onclick = () => { limit = 10; $('#sort').value = 'rank'; render(); };
$('#next').onclick = () => { limit += 10; render(); };
$('#clear').onclick = () => { selected.clear(); render(); };
$('#clear-filters').onclick = () => { $('#search').value = ''; $('#filter').value = 'all'; limit = 10; render(); };
$('#download-all').onclick = () => download(new Set(records.map(r => r.id)));
$('#download-selected').onclick = () => download(selected);
$('#method-nav').onclick = methodology; $('#method-link').onclick = methodology;
$('#guide').onclick = guide; $('#guide-nav').onclick = guide;
$('#sources-nav').onclick = () => modal('Research sources', '<div class="banner amber">This presentation contains fictional records only.</div><div class="source-row"><div><strong>Official attorney registration</strong><p>Requires manual identity and standing checks in the working application.</p></div><span class="badge">Not connected</span></div><div class="source-row"><div><strong>Law firm websites</strong><p>Source citations and observations belong to the research record.</p></div><span class="badge">Not connected</span></div><div class="source-row"><div><strong>Reviews and directories</strong><p>Missing reviews remain unknown. No reviews are invented.</p></div><span class="badge">Not connected</span></div>');
$('#refresh').onclick = () => modal('Refresh Rankings', '<p>Live research is not connected in this presentation. You can recalculate the existing fictional sample scores to illustrate the workflow.</p><div class="dialog-actions"><button id="recalculate" class="primary">Recalculate sample scores</button></div>') || ($('#recalculate').onclick = () => { render(); $('#ranking-status').textContent = 'Fictional sample scores recalculated · no new evidence retrieved'; $('#dialog').close(); notice('Sample scores recalculated. No live sources were queried.'); });
$('#reset').onclick = () => { limit = 10; selected.clear(); notes.clear(); $('#search').value = ''; $('#filter').value = 'all'; $('#sort').value = 'rank'; $('#ranking-status').textContent = 'Sample snapshot · B01-BASE-1.0 · provisional research'; render(); notice('Presentation reset. Ready for another take.'); };
$('#dialog-close').onclick = () => $('#dialog').close();
$('#dialog').addEventListener('close', () => lastFocus?.isConnected && lastFocus.focus());
render();
