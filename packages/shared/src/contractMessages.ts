/**
 * English text for every error and warning code of the ECG lambdas' contract. The lambdas may send their
 * messages in another language, so the app always shows these instead of the message it receives.
 */
export const CONTRACT_MESSAGES: Record<string, string> = {
  INVALID_PAYLOAD: 'The request must be a JSON object.',
  UNSUPPORTED_CONTRACT_VERSION: 'Unsupported contract version for this operation.',
  REQUEST_ID_INVALID: 'Missing or invalid request id.',
  MOCK_SCENARIO_INVALID: 'Invalid test scenario.',
  STORAGE_ERROR: 'Could not read or save the files of this exam. Please try again.',
  INTERNAL_ERROR: 'An unexpected error occurred during processing. Please try again.',
  IMAGE_SOURCE_FORBIDDEN: 'This image source is reserved for tests.',
  IMAGE_MISSING: 'The ECG image is missing.',
  IMAGE_NOT_FOUND: 'The uploaded image could not be found.',
  IMAGE_FORMAT_UNSUPPORTED: 'Unsupported image format; send a JPG, PNG or WebP.',
  IMAGE_TOO_LARGE: 'The image is larger than the 15 MB limit.',
  IMAGE_TOO_SMALL: 'The resolution is too low; the image must be at least 800×500 px.',
  IMAGE_UNREADABLE: 'The uploaded image could not be decoded.',
  LAYOUT_MISSING: 'The lead layout is missing (e.g. 3 × 4 + 1 rhythm).',
  LAYOUT_UNSUPPORTED: 'This lead layout is not supported.',
  READ_REFUSED_UNREADABLE_TRACE: 'No method could recover a reliable trace; send another photo.',
  READ_SELECTOR_UNAVAILABLE: 'The reading model is unavailable; the photo was not processed.',
  CALIBRATION_INVALID: 'Invalid calibration; use 12.5/25/50 mm/s and 5/10/20 mm/mV.',
  READ_REFUSED_BLURRY: 'The image is blurry or out of focus; take the photo again with the paper sharp.',
  READ_REFUSED_CROPPED: 'The trace is cut off at the edges; fit the whole paper in the photo.',
  READ_REFUSED_OCCLUDED: 'Something covers the trace (finger, glare, object or note); remove it and take the photo again.',
  READ_REFUSED_LOW_CONTRAST: 'Not enough contrast between the trace and the grid; improve the lighting.',
  READ_REFUSED_NOT_ECG: 'The image does not look like a paper ECG.',
  READ_REFUSED_LAYOUT_MISMATCH: 'The detected layout does not match the chosen layout.',
  READ_GRID_NOT_FOUND: 'Could not find the grid of the ECG paper.',
  READ_TRACE_EXTRACTION_FAILED: 'Could not extract the trace of the leads.',
  SEX_MISSING: "The patient's sex is missing.",
  SEX_INVALID: "Invalid patient sex; use F or M.",
  SIGNAL_MISSING: 'The ECG signal is missing.',
  SIGNAL_INVALID: 'The ECG signal has an invalid format.',
  SIGNAL_SAMPLING_RATE_INVALID: 'Invalid sampling rate; use 100 to 2000 Hz.',
  SIGNAL_LEAD_UNKNOWN: 'Unknown lead in the signal.',
  SIGNAL_TOO_SHORT: 'The extracted trace is too short; every lead needs at least 1 s of signal.',
  INTERP_NO_QRS_DETECTED: 'No QRS complex was detected in the signal.',
  INTERP_SIGNAL_TOO_NOISY: 'The signal is too noisy for a reliable interpretation.',
  AMBIGUOUS_TRACE: 'The trace has ambiguous regions that need human review.',
  GRID_CALIBRATION_UNCERTAIN: 'Grid calibration not confirmed.',
  GEOMETRY_FALLBACK: 'Geometry estimated by a fallback method.',
  ORIENTATION_UNCERTAIN: 'Image orientation could not be confirmed.',
  METHODS_PARTIAL_RESULT: 'Some methods produced no signal.',
  LEAD_PARTIAL_TRACE: 'Trace only partially extracted; unread stretches are left blank.',
  LEAD_SATURATED: 'Trace touches the neighbouring lead; amplitudes may be clipped.',
  IMAGE_ROTATION_CORRECTED: 'The image was tilted and was aligned automatically.',
  CALIBRATION_PULSE_NOT_FOUND: 'Calibration pulse not found; the chosen calibration was used.',
  LEAD_MISSING: 'Lead missing from the signal; criteria that depend on it were skipped.',
  LEAD_LOW_QUALITY: 'Low-quality lead; measurements on it are less reliable.',
  MEASUREMENT_UNRELIABLE: 'Measurement computed with low confidence.',
}

/** Replaces, anywhere in an API response, the message of each known contract code with its English text. */
export function translateContractMessages<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(translateContractMessages)
  } else if (value && typeof value === 'object') {
    const node = value as Record<string, unknown>
    if (typeof node.code === 'string' && typeof node.message === 'string' && CONTRACT_MESSAGES[node.code]) {
      node.message = CONTRACT_MESSAGES[node.code]
    }
    Object.values(node).forEach(translateContractMessages)
  }
  return value
}
