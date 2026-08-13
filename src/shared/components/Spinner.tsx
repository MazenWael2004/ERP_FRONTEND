import { Oval } from 'react-loader-spinner'

export default function Spinner(){
    return (
      <div className="flex min-h-screen items-center justify-center">
  <Oval
    height={50}
    width={50}
    color="#2563eb"
    visible={true}
    ariaLabel="loading"
  />
</div>
    )
}