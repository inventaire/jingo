// Adapted from https://github.com/expressjs/morgan 1.1.1
module.exports = ({ skip }) => (req, res, next) => {
  req._startAt = process.hrtime()

  const logRequest = () => {
    res.removeListener('finish', logRequest)
    res.removeListener('close', logRequest)
    if (skip(req, res)) return
    const line = format(req, res)
    if (line == null) return
    return process.stdout.write(`${line}\n`)
  }

  res.on('finish', logRequest)
  res.on('close', logRequest)

  return next()
}

const format = (req, res) => {
  const { method, originalUrl: url, user } = req
  const { statusCode: status } = res

  const color = statusCategoryColor[status.toString()[0]] || noColor
  const base = `\x1b[90m${method} ${url} \x1b[${color}m${status} \x1b[90m${responseTime(req, res)}ms`

  if (user) {
    return `${base} - u:${user._id}\x1b[0m`
  } else {
    return `${base}\x1b[0m`
  }
}

const statusCategoryColor = {
  5: 31, // red
  4: 33, // yellow
  3: 36, // cyan
  2: 32 // green
}

const noColor = 0

const responseTime = (req, res) => {
  if (res._header == null || req._startAt == null) return ''
  const [ seconds, nanoseconds ] = Array.from(process.hrtime(req._startAt))
  const ms = (seconds * 1000) + (nanoseconds / 1000000)
  return ms.toFixed(3)
}
