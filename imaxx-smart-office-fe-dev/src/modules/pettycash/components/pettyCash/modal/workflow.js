export function modalTheme(status) {
  if (status === 'Completed') return 'green'
  if (status === 'Rejected' || status === 'Canceled' || status === 'Cancelled') return 'red'
  if (status?.includes('Waiting')) return 'yellow'
  return 'slate'
}

export function currentLocation({ status, stateDetail, currentRole, roleName }) {
  if (status === 'Completed') return 'Process Finished'
  if (status === 'Rejected') return 'Returned to Requester'
  if (status === 'Canceled' || status === 'Cancelled') return 'Cancelled by Requester'
  if (stateDetail) return stateDetail
  if (currentRole || roleName) return `Waiting for ${currentRole || roleName}`
  if (status?.includes('Waiting')) return status
  return 'Draft'
}
