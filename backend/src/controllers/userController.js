function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId || '',
  }
}

export function getProfile(request, response) {
  response.json({ user: publicUser(request.user) })
}

export async function updateProfile(request, response) {
  const { name, studentId } = request.body
  const updates = {}
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
      response.status(400).json({ message: 'Name must be between 2 and 80 characters.' })
      return
    }
    updates.name = name.trim()
  }
  if (studentId !== undefined && request.user.role === 'student') {
    if (typeof studentId !== 'string' || studentId.trim().length > 40) {
      response.status(400).json({ message: 'Student ID must be 40 characters or fewer.' })
      return
    }
    updates.studentId = studentId.trim()
  }

  const user = Object.assign(request.user, updates)
  await user.save()
  response.json({ user: publicUser(user) })
}
