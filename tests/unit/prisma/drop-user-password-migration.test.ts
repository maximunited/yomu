import fs from 'fs';
import path from 'path';

describe('drop user password migration', () => {
  it('drops legacy User.password column', () => {
    const sql = fs.readFileSync(
      path.join(
        process.cwd(),
        'prisma/migrations/20260814010000_drop_user_password/migration.sql'
      ),
      'utf8'
    );
    expect(sql).toMatch(/DROP COLUMN IF EXISTS "password"/i);
  });
});
