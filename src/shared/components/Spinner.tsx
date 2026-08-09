import { Oval } from 'react-loader-spinner'

export default function Spinner(){
    return (
        <Oval
  height={80}
  width={80}
  color="#3170a8"
  visible={true}
  ariaLabel="oval-loading"
  secondaryColor="#242e6c"
  strokeWidth={3}
  strokeWidthSecondary={3}
/>
    )
}