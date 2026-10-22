import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Systeme Multi-Agents & Documentation Partagee (Audit & Evolution)', async (t) => {
  const rootDir = path.resolve(__dirname, '..', '..');

  await t.test('Presence des 3 referentiels documentaires partages dans docs/', () => {
    const docsDir = path.join(rootDir, 'docs');
    assert.ok(fs.existsSync(docsDir), 'Le repertoire docs/ doit exister a la racine');

    const expectedDocs = ['USER-FLOWS.md', 'DESIGN-SYSTEM.md', 'DEFINITION-OF-DONE.md'];
    for (const doc of expectedDocs) {
      const docPath = path.join(docsDir, doc);
      assert.ok(fs.existsSync(docPath), `docs/${doc} doit exister`);
      const content = fs.readFileSync(docPath, 'utf8');
      assert.ok(content.length > 500, `docs/${doc} doit contenir une documentation substantielle`);
    }
  });

  await t.test('Presence et conformite de la skill locale product-activation-audit', () => {
    const skillPath = path.join(rootDir, '.agents', 'skills', 'product-activation-audit', 'SKILL.md');
    assert.ok(fs.existsSync(skillPath), 'La skill product-activation-audit doit exister dans .agents/skills/');

    const content = fs.readFileSync(skillPath, 'utf8');
    assert.match(content, /^---\r?\nname:\s*product-activation-audit/m, 'Le frontmatter name doit etre defini');
    assert.match(content, /description:\s*>/m, 'La description de la skill doit etre definie');
    assert.match(content, /FCFA/m, 'La skill doit traiter des specificites FCFA');
    assert.match(content, /DemoActionModal/m, 'La skill doit verifier la modal de demo');
  });

  await t.test('Fiche Architecte configuree comme Orchestrateur Universel', () => {
    const architectPath = path.join(rootDir, '.agent', 'agents', 'architecte.md');
    assert.ok(fs.existsSync(architectPath), 'architecte.md doit exister');

    const content = fs.readFileSync(architectPath, 'utf8');
    assert.match(content, /Orchestrateur Universel/i, 'L architecte doit etre declare orchestrateur');
    assert.match(content, /Mode Fast-Track/i, 'Le mode Fast-Track doit etre defini');
    assert.match(content, /Workflow Complet/i, 'Le workflow complet doit etre defini');
    assert.match(content, /docs\/USER-FLOWS\.md/, 'L architecte doit referencer USER-FLOWS.md');
    assert.match(content, /docs\/DESIGN-SYSTEM\.md/, 'L architecte doit referencer DESIGN-SYSTEM.md');
    assert.match(content, /docs\/DEFINITION-OF-DONE\.md/, 'L architecte doit referencer DEFINITION-OF-DONE.md');
  });

  await t.test('Fiche UX & Logic Auditor enrichie du volet activation et conversion', () => {
    const uxAuditorPath = path.join(rootDir, '.agent', 'agents', 'ux-logic-auditor.md');
    assert.ok(fs.existsSync(uxAuditorPath), 'ux-logic-auditor.md doit exister');

    const content = fs.readFileSync(uxAuditorPath, 'utf8');
    assert.match(content, /Skill 7 — Product Activation & Conversion Audit/i, 'Skill 7 doit etre presente');
    assert.match(content, /product-activation-audit/, 'ux-logic-auditor doit referencer la skill product-activation-audit');
  });

  await t.test('Absence stricte d emojis dans les fichiers .agent et docs', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    const checkDirForEmojis = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDirForEmojis(full);
        } else if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(full, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            assert.ok(!emojiRegex.test(line), `Emoji interdit detecte dans ${full} ligne ${index + 1}: ${line.trim()}`);
          });
        }
      }
    };

    checkDirForEmojis(path.join(rootDir, '.agent'));
    checkDirForEmojis(path.join(rootDir, 'docs'));
  });
});
