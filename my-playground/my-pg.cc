// Running the my-pg.js file with exposing log function in globals

// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <execinfo.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include <chrono>
#include <ctime>
#include <iostream>
#include <map>
#include <string>
#include <thread>
#include <tuple>


#include "include/libplatform/libplatform.h"
#include "include/v8-array-buffer.h"
#include "include/v8-context.h"
#include "include/v8-exception.h"
#include "include/v8-external.h"
#include "include/v8-fast-api-calls.h"
#include "include/v8-function.h"
#include "include/v8-initialization.h"
#include "include/v8-isolate.h"
#include "include/v8-local-handle.h"
#include "include/v8-object.h"
#include "include/v8-persistent-handle.h"
#include "include/v8-primitive.h"
#include "include/v8-script.h"
#include "include/v8-snapshot.h"
#include "include/v8-template.h"
#include "include/v8-value.h"
#include "setup.cc"


using std::string;

using v8::ArrayBuffer;
using v8::Context;
using v8::EscapableHandleScope;
using v8::External;
using v8::Function;
using v8::FunctionTemplate;
using v8::Global;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::MaybeLocal;
using v8::Name;
using v8::NamedPropertyHandlerConfiguration;
using v8::NewStringType;
using v8::Object;
using v8::ObjectTemplate;
using v8::Persistent;
using v8::PropertyCallbackInfo;
using v8::Script;
using v8::String;
using v8::TryCatch;
using v8::V8;
using v8::Value;

Isolate* isolate;


class Playground {
 public:
  Playground(Local<Context> context, Isolate* isolate) {
    context_ = context;
    isolate_ = isolate;
  }

  int RunJSFile() {
    Local<String> source;

    if (!readFile(GetIsolate(), js_file_to_run("my-pg.js")).ToLocal(&source)) {
      fprintf(stderr, "Error reading file.\n");
      return 1;
    }

    ExecuteString(GetIsolate(), source);

    return 0;
  }

  static Local<Context> setupGlobals(Isolate* isolate) {
    // Create a template for the global object and set the
    // built-in global functions.
    Local<ObjectTemplate> global = ObjectTemplate::New(isolate);
    global->Set(String::NewFromUtf8(isolate, "log").ToLocalChecked(),
                FunctionTemplate::New(isolate, Playground::LogCallback));

    // Create a new context.
    return Context::New(isolate, nullptr, global);
  }

  static void LogCallback(const v8::FunctionCallbackInfo<Value>& info) {
    if (info.Length() < 1) return;
    Isolate* isolate = info.GetIsolate();
    HandleScope scope(isolate);
    Local<Value> arg = info[0];
    String::Utf8Value value(isolate, arg);
    printf("Logged: %s\n", *value);
  }

  Isolate* GetIsolate() { return isolate_; }
  Local<Context> GetContext() { return context_; }

  Isolate* isolate_;
  Isolate::CreateParams create_params_;
  Local<Context> context_;
};

// -------------------

int main(int argc, char* argv[]) {
  printf("Initializing V8\n");

  V8::InitializeICUDefaultLocation(argv[0]);
  V8::InitializeExternalStartupData(argv[0]);
  std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();
  V8::InitializePlatform(platform.get());
  V8::Initialize();

  // Create a new Isolate and make it the current one.
  Isolate::CreateParams create_params;
  create_params.array_buffer_allocator =
      ArrayBuffer::Allocator::NewDefaultAllocator();
  Isolate* isolate = Isolate::New(create_params);

  {
    Isolate::Scope isolate_scope(isolate);

    // Create a stack-allocated handle scope.
    HandleScope handle_scope(isolate);

    Local<Context> context = Playground::setupGlobals(isolate);

    // Enter the context for compiling and running the hello world script.
    Context::Scope context_scope(context);

    Playground playground(context, isolate);

    playground.RunJSFile();
  }

  // Cleanup
  // Dispose the isolate and tear down V8.
  isolate->Dispose();
  V8::Dispose();
  V8::DisposePlatform();
  delete create_params.array_buffer_allocator;

  return 0;
}
