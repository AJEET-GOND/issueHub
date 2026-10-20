export function requireStudent(request, response, next) {
  if (request.user?.role !== 'student') {
    response.status(403).json({ message: 'Only student accounts can vote on campus issues.' })
    return
  }
  next()
}
