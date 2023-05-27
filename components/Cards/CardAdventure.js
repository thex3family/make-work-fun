import Card from 'react-animated-3d-card'

export default function CardAdventure() {
    return (
        <Card
            style={{
                background: 'linear-gradient(to right, #4edbac, #13AA78, #258766)',
                width: '450px',
                height: '300px',
                cursor: 'pointer'
            }}
            onClick={() => console.log('Hola')}
        >
            <div>
                <label
                    style={{
                        color: 'white',
                        position: 'absolute',
                        left: '25px',
                        top: '25px',
                        height: '35px',
                        opacity: 1,
                    }}
                ><div
                    style={{
                        fontSize: '20px'
                    }}
                    className="font-semibold">S-Rank Adventurer</div>
                    <div style={{
                        color: 'white',
                        opacity: 0.5,
                    }}>Active Patron 🐣</div></label>
                <img
                    style={{
                        position: 'absolute',
                        right: '25px',
                        top: '25px',
                        height: '35px'
                    }}
                    src='/img/co-x3logo_white_full.png'
                    class='card-item__chip'
                    alt='credit card chip'
                ></img>
            </div>
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div
                    className="w-full grid grid-cols-3 gap-2 px-7"
                    onClick={console.log('prova')}
                >
                    <label>
                        <div
                            style={{
                                color: 'white',
                                opacity: 0.5
                            }}>Level</div>
                        <div
                            style={{
                                fontSize: '30px',
                                color: 'white'
                            }}>100</div>
                    </label>
                    <label>
                        <div
                            style={{
                                color: 'white',
                                opacity: 0.5
                            }}>Life Points</div>
                        <div
                            style={{
                                fontSize: '30px',
                                color: 'white'
                            }}>42k</div>
                    </label>
                    <label>
                        <div
                            style={{
                                color: 'white',
                                opacity: 0.5
                            }}>Roles</div>
                        <div
                            style={{
                                fontSize: '30px',
                                color: 'white'
                            }}>🔥🛡️💡</div>
                    </label>
                </div>
            </div>
            <div>
                <label
                    style={{
                        color: 'white',
                        position: 'absolute',
                        bottom: '60px',
                        left: '25px',
                        opacity: 0.5
                    }}
                >
                    Name
                </label>
                <label
                    style={{
                        color: 'white',
                        position: 'absolute',
                        bottom: '60px',
                        right: '25px',
                        opacity: 0.5
                    }}
                >
                    Since
                </label>
            </div>

            <div>
                <label
                    style={{
                        color: 'white',
                        position: 'absolute',
                        bottom: '25px',
                        left: '25px',
                        opacity: 1,
                        fontSize: '25px'
                    }}
                >
                    Conrad
                </label>
                <label
                    style={{
                        color: 'white',
                        position: 'absolute',
                        bottom: '25px',
                        right: '25px',
                        opacity: 1,
                        fontSize: '25px'
                    }}
                >
                    Nov 2019
                </label>
            </div>

        </Card>
    )
}