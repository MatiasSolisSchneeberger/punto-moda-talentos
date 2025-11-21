import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Button from './components/Button'
import { IconArrowLeft, IconInfinity } from '@tabler/icons-react'
import ButtonIcon from './components/ButtonIcon'

function App() {
    return (
        <>
            <Button style={"primary"}
                iconLeft={
                    <IconArrowLeft size={20} />
                }
            >
                Boton re fachero
            </Button>

            <ButtonIcon style='secondary'>
                <IconInfinity size={20} />
            </ButtonIcon>
            <ButtonTheme ></ButtonTheme>
        </>
    )
}

export default App
