import { ARClient } from "../_components/ARClient/ARClient";

export default async function Page() {
    

    const a = 'test'

    // eslint-disable-next-line no-console
    console.log('a', a);


    return (
        <div>
            <h1>Visualizer</h1>
            <ARClient />
        </div>
    )
}