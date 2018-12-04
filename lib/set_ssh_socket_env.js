const { execSync } = require('child_process')

module.exports = function () {
  const sshData = execSync('ssh-agent').toString()
  const socketPath = sshData.match(/SSH_AUTH_SOCK=([^;]+);/)[1]
  console.log('ssh socket path', socketPath)
  process.env['SSH_AUTH_SOCK'] = socketPath
}
