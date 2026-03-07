interface FeedbackToastProps {
  kind: 'success' | 'info' | 'warning'
  message: string
}

export const FeedbackToast = ({ kind, message }: FeedbackToastProps) => {
  return <div className={`feedback-toast ${kind}`}>{message}</div>
}
