import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image, File } from 'lucide-react';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
    maxFiles?: number;
    className?: string;
    disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUpload,
    multiple = false,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 10,
    className,
    disabled = false
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [rejectedFiles, setRejectedFiles] = useState<{ file: File; errors: any[] }[]>([]);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (disabled) return;

        const validFiles = acceptedFiles.slice(0, maxFiles - files.length);
        setFiles(prev => [...prev, ...validFiles]);
        setRejectedFiles(rejectedFiles);

        if (validFiles.length > 0) {
            onUpload(validFiles);
        }
    }, [files.length, maxFiles, onUpload, disabled]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept: accept ? { [accept]: [] } : undefined,
        maxSize,
        disabled
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearRejected = () => {
        setRejectedFiles([]);
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                    {isDragActive ? (
                        <p className="text-primary font-medium">Drop the files here...</p>
                    ) : (
                        <>
                            <p className="text-gray-600">
                                Drag & drop files here, or click to select files
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max size: {maxSize / 1024 / 1024}MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Selected files */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selected Files:</h4>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {file.type.startsWith('image/') ? (
                                    <Image className="h-8 w-8 text-blue-500" />
                                ) : (
                                    <File className="h-8 w-8 text-gray-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejected files */}
            {rejectedFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-red-600">Rejected Files:</h4>
                        <Button variant="ghost" size="sm" onClick={clearRejected}>
                            Clear
                        </Button>
                    </div>
                    {rejectedFiles.map(({ file, errors }, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-800">{file.name}</p>
                                    <p className="text-xs text-red-600">
                                        {errors.map(error => error.message).join(', ')}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setRejectedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Image upload preview component
interface ImageUploadPreviewProps {
    files: File[];
    onRemove: (index: number) => void;
    uploadProgress?: { [key: string]: number };
    className?: string;
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
    files,
    onRemove,
    uploadProgress = {},
    className
}) => {
    return (
        <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
            {files.map((file, index) => {
                const progress = uploadProgress[file.name] || 0;
                const previewUrl = URL.createObjectURL(file);

                return (
                    <div key={index} className="relative group border rounded-lg overflow-hidden">
                        <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-32 object-cover"
                        />

                        {/* Upload progress */}
                        {progress > 0 && progress < 100 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Progress value={progress} className="w-3/4" />
                            </div>
                        )}

                        {/* Remove button */}
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onRemove(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>

                        {/* File info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                            <p className="text-xs truncate">{file.name}</p>
                            <p className="text-xs text-gray-300">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};