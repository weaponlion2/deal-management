import { Dialog, DialogContent, Button, TextField, Divider, Box, CircularProgress } from '@mui/material'
import React, { useCallback, useState } from 'react';
import myAxios from './api';
import { AxiosError } from 'axios';

type Props = {
    alterSearchBar: (val: boolean) => () => void,
    open: boolean
}

export const SearchBar = ({ alterSearchBar, open }: Props) => {
    const [query, setQuery] = useState<string | null>(null);
    const [loader, startLoader] = useState<boolean>(false);

    const getData = useCallback(async (val: string) => {
        startLoader(true);
        try { //2024-12-20
            await myAxios.get(`/Deal/SearchDeal?parameter=${val}`);
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }
        }
        startLoader(false)
    }, []);

    return (
        <Dialog
            open={open}
            onClose={alterSearchBar(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{ backgroundColor: "rgba(87, 99, 117, 0.5)", backdropFilter: "blur(1px)" }}
        >
            <DialogContent sx={{ p: 0, width: 650, maxWidth: 650 }}>
                <Box sx={{ width: "100%", p: 0, display: "flex" }}>
                    <TextField type='text' value={query} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setQuery(e.target.value)} variant='standard' placeholder='Search here...' size='small' name='searhbar' sx={{ minHeight: 40, borderRadius: 2, fontSize: 23, p: 1, width: 520, border: 'none', outline: 'none', boxShadow: 'none', }} />
                    <Button onClick={() => query && getData(query)}>Search</Button>
                </Box>
                <Divider />
                <Box sx={{ width: "100%", p: 2, height: 300 }}>
                    {loader && <CircularProgress color="inherit" size={30} />}
                </Box>
            </DialogContent>
        </Dialog>
    )
}