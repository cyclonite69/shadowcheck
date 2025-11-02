#!/bin/bash
# Auto-register PostgreSQL server in pgAdmin on startup

echo "Waiting for pgAdmin to initialize..."
sleep 10

echo "Registering ShadowCheck Production server..."

docker exec -u pgadmin shadowcheck_pgadmin python3 << 'PYEOF'
import sys
sys.path.insert(0, '/pgadmin4')

from pgadmin.model import db, Server, ServerGroup, User
from pgadmin import create_app

app = create_app()

with app.app_context():
    user = User.query.filter_by(email='admin@admin.com').first()
    if not user:
        print("ERROR: Admin user not found")
        sys.exit(1)

    existing = Server.query.filter_by(user_id=user.id, name='ShadowCheck Production').first()
    if existing:
        print(f"✅ Server already registered (ID: {existing.id})")
        sys.exit(0)

    group = ServerGroup.query.filter_by(user_id=user.id, name='Servers').first()
    if not group:
        group = ServerGroup(user_id=user.id, name='Servers')
        db.session.add(group)
        db.session.commit()

    server = Server(
        user_id=user.id,
        servergroup_id=group.id,
        name='ShadowCheck Production',
        host='postgres',
        port=5432,
        maintenance_db='shadowcheck',
        username='shadowcheck_user',
        ssl_mode='prefer',
        passfile='/pgadmin4/pgpassfile',
        comment='ShadowCheck PostgreSQL 18 Production Database'
    )

    db.session.add(server)
    db.session.commit()

    print(f"✅ Server registered successfully (ID: {server.id})")
PYEOF

echo "Registration complete!"
