const user = ['maximilian', 'g', 'lombardo'].join('.')
const domain = ['gmail', 'com'].join('.')
export function assembleEmail(): string {
  return `${user}@${domain}`
}
