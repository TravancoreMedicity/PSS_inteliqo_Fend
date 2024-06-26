// import { Box } from '@mui/joy'
import { Paper } from '@mui/material'
import React, { Fragment, memo } from 'react'
// import { useTheme } from '@mui/material/styles';
// import MobileStepper from '@mui/material/MobileStepper';
// import Button from '@mui/material/Button';
// import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
// import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
// import SwipeableViews from 'react-swipeable-views';
// import { autoPlay } from 'react-swipeable-views-utils';

const TrainingCarousel = ({ em_name }) => {

    // const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

    // const images = [
    //     {
    //         label: 'San Francisco – Oakland Bay Bridge, United States',
    //         imgPath:
    //             'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60',
    //     },
    //     {
    //         label: 'Bird',
    //         imgPath:
    //             'https://images.unsplash.com/photo-1538032746644-0212e812a9e7?auto=format&fit=crop&w=400&h=250&q=60',
    //     },
    //     {
    //         label: 'Bali, Indonesia',
    //         imgPath:
    //             'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&h=250',
    //     },
    //     {
    //         label: 'Goč, Serbia',
    //         imgPath:
    //             'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&w=400&h=250&q=60',
    //     },
    // ];


    // const theme = useTheme();
    // const [activeStep, setActiveStep] = useState(0);
    // const maxSteps = images.length;

    // const handleNext = () => {
    //     setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // };

    // const handleBack = () => {
    //     setActiveStep((prevActiveStep) => prevActiveStep - 1);
    // };

    // const handleStepChange = (step) => {
    //     setActiveStep(step);
    // };

    return (
        <Fragment>
            <Paper elevation={0} sx={{ flex: 1, boxShadow: 4, p: 1, backgroundColor: "#FFFFFF" }}>
                <h5>Welcome {em_name}</h5>
            </Paper>
            {/* <Paper elevation={0} sx={{ flex: 1, boxShadow: 4, p: 1, backgroundColor: "#FFFFFF" }}>
                <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                    <Box sx={{ width: "100%", flexGrow: 1 }}>
                        <Paper
                            square
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                // pl: 2,
                                bgcolor: 'background.default',
                            }}
                        >
                            <Typography>{images[activeStep].label}</Typography>
                        </Paper>
                        <AutoPlaySwipeableViews
                            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                            index={activeStep}
                            onChangeIndex={handleStepChange}
                            enableMouseEvents
                        >
                            {images.map((step, index) => (
                                <div key={step.label}>
                                    {Math.abs(activeStep - index) <= 2 ? (
                                        <Box
                                            component="img"
                                            sx={{
                                                height: "100%",
                                                display: 'block',
                                                overflow: 'hidden',
                                                width: '100%',
                                            }}
                                            src={step.imgPath}
                                            alt={step.label}
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </AutoPlaySwipeableViews>
                        <MobileStepper
                            steps={maxSteps}
                            position="static"
                            activeStep={activeStep}
                            nextButton={
                                <Button
                                    size="small"
                                    onClick={handleNext}
                                    disabled={activeStep === maxSteps - 1}
                                >
                                    Next
                                    {theme.direction === 'rtl' ? (
                                        <KeyboardArrowLeft />
                                    ) : (
                                        <KeyboardArrowRight />
                                    )}
                                </Button>
                            }
                            backButton={
                                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                    {theme.direction === 'rtl' ? (
                                        <KeyboardArrowRight />
                                    ) : (
                                        <KeyboardArrowLeft />
                                    )}
                                    Back
                                </Button>
                            }
                        />
                    </Box>
                </Box>
            </Paper> */}
        </Fragment>


    )
}

export default memo(TrainingCarousel) 
