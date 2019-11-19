import React from "react";
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function ModalEvent(props) {
    console.log(props.event.title)
    return (
        <>
            <DialogTitle id="scroll-dialog-title">Subscribe</DialogTitle>
            <DialogContent dividers={props.scroll === 'paper'}>
                <DialogContentText  id="scroll-dialog-description"
                                    ref={props.descriptionElementRef}
                                    tabIndex={-1}>
                        Cras mattis consectetur purus sit amet fermentum.
                        Cras justo odio, dapibus ac facilisis in, egestas eget quam.
                        Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
                        Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
                </DialogContentText>
            </DialogContent>
        </>
    );
}
