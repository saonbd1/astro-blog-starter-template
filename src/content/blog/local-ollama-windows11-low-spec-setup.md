---
title: "How to Run Ollama Locally on a Low-Spec Windows 11 PC"
description: "With a small model and a few tweaks, a 4 GB RAM laptop can serve text generation in under a second. This guide shows the minimum setup that works on weak hardware"
pubDate: "Sep 03 2026"
heroImage: "/ollama-windows-cover-option-2.png"
category: "AI Tools"
tags: ["AI", "Windows", "Beginner Guide"]

---


# How to Run Ollama Locally on a Low-Spec Windows 11 PC

Ollama can run large language models on your own computer. You do not need a GPU. You do not need any cloud storage. With a small model and a few tweaks, a 4 GB RAM laptop can serve text generation in under a second.

This guide shows the minimum setup that works on weak hardware.

## What You Need

- Windows 10 or 11, 64-bit
- Minimum 4 GB of RAM Recommended 8 GB
- About 5 GB of free disk space

## Step 1: Install Ollama

Download the Windows installer from the Ollama website. Run the file. Accept the defaults. Ollama starts as a background service and listens on port `11434`.

## Step 2: Pick a Small Model

Large models need more RAM than a weak PC has. Pick a model that fits your memory.

For 4 GB of free RAM, use the smallest tier:

```
ollama pull tinyllama
```

For 6 to 8 GB of free RAM, use a balanced tier:

```
ollama pull phi3:mini
```

For 8 GB or more of free RAM, use a stronger tier:

```
ollama pull llama3.2:3b
```

The first pull downloads the weights. A small model is about 600 MB. A larger model is about 2 GB.

## Step 3: Run the Model

Open PowerShell. Start a chat session:

```
ollama run tinyllama
```

Type any question. Press Enter. Wait for the reply. The first reply takes longer because the model loads into memory.

To stop the session, type `/bye`.

## Step 4: Lower Memory Use

These settings reduce RAM use on low config hardware. Open PowerShell as admin and run the commands before you start the model.

Set the number of layers the GPU can load. Zero means the CPU does all the work:

```
[System.Environment]::SetEnvironmentVariable("OLLAMA_NUM_GPU", "0", "User")
```

Set the number of CPU threads. Match the number of physical cores:

```
[System.Environment]::SetEnvironmentVariable("OLLAMA_NUM_THREADS", "4", "User")
```

Set the context size. A smaller context uses less memory:

```
[System.Environment]::SetEnvironmentVariable("OLLAMA_NUM_CTX", "512", "User")
```

Restart PowerShell so the new settings take effect.

## Step 5: Talk to the API

Ollama serves a local HTTP API on port `11434`. Send a prompt from any tool like command prompts, powershell or any others that can make an HTTP request.

Example with `curl`:

```
curl http://localhost:11434/api/generate -d '{
  "model": "tinyllama",
  "prompt": "Explain HTTP in one sentence.",
  "stream": false
}'
```

The response is JSON. The text is in the `response` field.

## Step 6: Stop the Service

Ollama runs in the background. To free the RAM, stop the service from PowerShell as admin:

```
Stop-Service -Name "Ollama"
```

Start it again later with:

```
Start-Service -Name "Ollama"
```

## Troubleshooting

### The model is slow

Close every other program that uses RAM. A browser tab can use more memory than the model itself.

### PowerShell reports `ollama` is not recognized

Open a new PowerShell window. The installer adds Ollama to the PATH for new sessions only.

### The model stops mid-sentence

The process ran out of memory. Pick a smaller model. Lower `OLLAMA_NUM_CTX` to `256`.

### Port `11434` is in use

Another program uses the port. Stop the program, or set a different port before you start Ollama:

```
[System.Environment]::SetEnvironmentVariable("OLLAMA_HOST", "127.0.0.1:11435", "User")
```

## A Note on Battery Life

Running a model on the CPU drains a laptop battery fast. Plug in the charger before you start a long session. Keep in mind, the cooling fan run louder than usual.

## What to Try Next

- Add a web UI such as Open WebUI for a chat interface
- Write a small script that calls the API for a specific task
- Swap the model for a larger one when you upgrade the RAM
