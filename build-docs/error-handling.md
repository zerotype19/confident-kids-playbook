# ❗ Confident Kids Playbook – Error & Permissions Handling

## ✅ Expected Error Scenarios

| Type       | Example                                     | Response       |
|------------|---------------------------------------------|----------------|
| 401        | No valid auth token                         | Unauthorized   |
| 403        | Child ID does not belong to user's family   | Forbidden      |
| 404        | Invalid challenge ID                        | Not Found      |
| 500        | DB or unknown error                         | Server Error   |

---

## 🧪 How to Handle in Code

### API Example
```ts
if (!user) return new Response("Unauthorized", { status: 401 });
if (child.family_id !== user.family_id) return new Response("Forbidden", { status: 403 });
```

---

## 🔁 Frontend UI

- Use toast or soft alerts for 401, 403, 500
- Redirect on 401 to login
- Show “not found” page for 404

