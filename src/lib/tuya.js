// /src/lib/tuya.js
import crypto from 'crypto';
import dotenv from 'dotenv';
import {retryDecorator} from "@/lib/common";

// Load environment variables from the .env file
dotenv.config();

const ACCESS_ID = process.env.TUYA_ACCESS_ID;  // Your Tuya Access ID
const ACCESS_SECRET = process.env.TUYA_ACCESS_SECRET;  // Your Tuya Access Secret
const DEVICE_ID = process.env.BALKONY_DEVICE_ID;  // The device you want to control
const REGION = process.env.TUYA_REGION;  // Your Tuya region (e.g., 'us', 'eu', 'cn')

function generateSignature(apiSecret, payload) {
    return crypto
        .createHmac('sha256', apiSecret) // HMAC-SHA256
        .update(payload, 'utf-8') // Encode payload as UTF-8
        .digest('hex') // Get the hash as a hexadecimal string
        .toUpperCase(); // Convert to uppercase (as in Python)
}

function createPayload(action, body, headers, signUrl, timestamp, token) {
    // Step 1: Convert body to SHA256 hash
    const bodyHash = crypto.createHash('sha256').update(body || '', 'utf-8').digest('hex');

    // Step 2: Construct the headers section based on "Signature-Headers"
    let headersString = '';
    const signatureHeaders = headers['Signature-Headers'] ? headers['Signature-Headers'].split(':') : [];

    signatureHeaders.forEach((key) => {
        if (headers[key]) {
            headersString += `${key}:${headers[key]}\n`;
        }
    });

    // Step 3: Extract the path from the signUrl
    const urlPath = '/' + signUrl.split('//').pop().split('/').slice(1).join('/');

    // Step 4: Construct the final payload
    return ACCESS_ID + token + timestamp + `${action}\n${bodyHash}\n${headersString}\n${urlPath}`;
}

export const getAccessToken = async () => {
    try {
        const uri = '/v1.0/token?grant_type=1';
        const addr = `https://openapi.tuya${REGION}.com${uri}`;
        const data = await getTuyaResponse(addr, uri, 'GET', {}, null, '');
        return data.result?.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
};

const getTuyaResponse = async (addr, uri, method, init_headers, body, token) => {
    const now = String(Date.now());
    const payload = createPayload(method, body, init_headers, uri, now, token);
    const headers = { ...init_headers, ...{
            'sign_method': 'HMAC-SHA256',
            'mode': 'cors',
            't': now,
            'sign': generateSignature(ACCESS_SECRET, payload),
            'client_id': ACCESS_ID,
            'secret': ACCESS_SECRET,
        }
    };

    if (token) {
        headers['access_token'] = token;
    } else {
        headers['secret'] = ACCESS_SECRET;
    }
    let request = {
        method: method,
        headers: headers,
    }
    if (method === 'POST') {
        request['body'] = body;
    }
    const response = await fetch(addr, request);

    return await response.json();
}

export const controlDevice = async (token, data) => {
    try {
        const uri = `/v1.0/iot-03/devices/${DEVICE_ID}/commands`;
        const addr = `https://openapi.tuya${REGION}.com${uri}`;
        const headers = {
            'Content-type': 'application/json',
            'Signature-Headers': 'Content-type',
        };
        let commands = [];
        if (data.action === 'turn_off' || data.action === 'turn_on') {
            commands.push({
                code: 'switch_led_1',
                value: data.action === 'turn_on',
            })
        } else if (data.action === 'set_brightness') {
            commands.push({
                code: 'bright_value_1',
                value: data.brightness,
            })
        } else {
            console.error('Invalid action:', data.action);
            return null;
        }
        const body = JSON.stringify({commands: commands});
        const result = await getTuyaResponse(addr, uri, 'POST', headers, body, token);
        if (!result) {
            console.error('Failed to control device');
            return null;
        }

        return retryDecorator(getStatus, 3, 1000)(token, commands);
    } catch (error) {
        console.error('Error controlling device:', error);
        return null;
    }
};

export const getStatus = async (token, expected=null) => {
    try {
        const uri = `/v1.0/iot-03/devices/${DEVICE_ID}/status`;
        const addr = `https://openapi.tuya${REGION}.com${uri}`;
        const data = await getTuyaResponse(addr, uri, 'GET', {}, null, token);
        const status = data.result;
        if (!status) return null;

        if (expected) {
            for (let i = 0; i < expected.length; i++) {
                if (status.find(item => item['code'] === expected[i].code).value !== expected[i].value) {
                    console.warn('Status mismatch. Retrying...');
                    throw new Error('Status mismatch');
                }
            }
        }

        return {
            on: status.find(item => item['code'] === 'switch_led_1').value,
            brightness: status.find(item => item['code'] === 'bright_value_1').value,
        }
    } catch (error) {
        console.error('Error controlling device:', error);
        throw error;
    }
};