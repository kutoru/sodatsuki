fn main() {
    println!(
        "cargo:rerun-if-changed={}",
        dotenv::from_filename("build.env").unwrap().display()
    );

    let curr_dir = std::env::current_dir().unwrap();

    for key in ["PYO3_PYTHON", "PYTHONPATH"] {
        let value = format!(
            "{}/../{}",
            curr_dir.to_str().unwrap(),
            dotenv::var(key).unwrap()
        );

        println!("cargo:rustc-env={}={}", key, value);
    }

    tauri_build::build()
}
