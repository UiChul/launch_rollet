// Claude Code PreToolUse hook: before Claude runs `git commit`, run lint, build and test.
// Exit 2 blocks the tool call and feeds stderr back to Claude; exit 0 lets it through.
import { spawnSync } from 'node:child_process';

const CHECKS = [
  ['lint', 'npm run lint'],
  ['build', 'npm run build'],
  ['test', 'npm test'],
];
const TAIL_LINES = 40;

// Matches `git commit`, `git -C dir commit`, and commits chained after `&&`/`;`.
const GIT_COMMIT = /(^|[\s;&|(])git(\s+-\S+(\s+\S+)?)*\s+commit\b/;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
  });
}

const input = JSON.parse((await readStdin()) || '{}');
const command = input.tool_input?.command ?? '';
if (!GIT_COMMIT.test(command)) process.exit(0);

const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

for (const [name, cmd] of CHECKS) {
  const res = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', env: { ...process.env, CI: '1' } });
  if (res.status !== 0) {
    const output = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim().split('\n').slice(-TAIL_LINES).join('\n');
    process.stderr.write(
      `커밋 차단: pre-commit 검사 중 '${name}' 단계가 실패했습니다 (\`${cmd}\`, exit ${res.status}).\n` +
        `문제를 고친 뒤 다시 커밋하세요.\n\n--- 출력 마지막 ${TAIL_LINES}줄 ---\n${output}\n`,
    );
    process.exit(2);
  }
}

process.stdout.write(
  JSON.stringify({ systemMessage: 'pre-commit 검사 통과: lint ✓ build ✓ test ✓' }),
);
