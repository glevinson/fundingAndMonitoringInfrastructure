{signatures.map((sig) => {
    return (
      <div className="p-2" key={sig}>
        <div className="my-3">
          <p>
            {/* Message {idx + 1}: {sig.message} */}
            Message: {sig.message}
          </p>
          <p>Signer: {sig.address}</p>
          <textarea
            type="text"
            readOnly
            ref={resultBox}
            className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
            placeholder="Loading Data..."
            value={data}
          />
        </div>
      </div>
    );
  })}