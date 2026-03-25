export function mockAuth(req, res, next) {
  const role = req.headers["x-user-role"] || "Requester";
  const userId = req.headers["x-user-id"] ? Number(req.headers["x-user-id"]) : null;
  req.user = { role, userId };
  next();
}

export function requireRole(allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for this role" });
    }
    next();
  };
}

